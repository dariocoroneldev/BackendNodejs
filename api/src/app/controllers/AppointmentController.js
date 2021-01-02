import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import es from 'date-fns/locale/es';
import Appointments from '../models/Appointments';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointments.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'canceled_at'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json('validacion fallida');
    }

    const { provider_id, date } = req.body;

    /**
     *verifcacion si el provider_id es un provider
     *check if user_id is a provider
     */

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json('solo es posible agendar con un proveedor de serivicios');
    }

    const hourStart = startOfHour(parseISO(date));

    /**
     * check for past time
     * verificacion si el tiempo es pasado del presente
     */
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'no es posible viajar al pasado!' });
    }

    /**
     * check date availavility
     * verificando disponibilidad del horario
     */

    const checkAvailavility = await Appointments.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailavility) {
      return res.status(400).json({
        error: 'horario ya fue marcado porfavor escoga otro horario!',
      });
    }
    const user_id = req.userId;

    if (user_id === provider_id) {
      return res.status(400).json({
        error: 'usted no puede agendarse consigo mismo!',
      });
    }

    const appointment = await Appointments.create({
      user_id,
      provider_id,
      date: hourStart,
    });

    /**
     * Notify provider
     * notificando al provider sobre la insercion de un agendamiento
     */
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      " 'dia' dd 'de' MMMM', a las 'H:mm' hs'",
      { locale: es }
    );

    await Notification.create({
      content: `Nuevo agendamiento de ${user.name} para el ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointments.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'usted no tiene permiso para realizar esta accion' });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'usted no puede cancelar su cita 2 horas antes de lo marcado',
      });
    }

    appointment.canceled_at = new Date();

    appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });
    return res.status(200).json(appointment);
  }
}

export default new AppointmentController();
