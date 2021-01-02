import {
  startOfDay,
  endOfDay,
  setHours,
  format,
  isAfter,
  setMinutes,
  setSeconds,
} from 'date-fns';

import { Op } from 'sequelize';
import Appointments from '../models/Appointments';

class AvaliableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'fecha no disponible' });
    }

    const searchDate = Number(date);

    const appointments = await Appointments.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
      '00:00',
    ];

    const avaliable = schedule.map((time) => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );
      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaliable:
          isAfter(value, new Date()) &&
          !appointments.find(
            (appointment) => format(appointment.date, 'HH:mm') === time
          ),
      };
    });

    return res.status(200).json(avaliable);
  }
}

export default new AvaliableController();
