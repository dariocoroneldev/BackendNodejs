import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointments from '../models/Appointments';
import User from '../models/User';

class AppointmentController {
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
     */ const isProvider = await User.findOne({
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
    const appointment = await Appointments.create({
      user_id,
      provider_id,
      date: hourStart,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
