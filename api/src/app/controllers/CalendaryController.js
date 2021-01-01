import { startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointments';
import User from '../models/User';

class CalendaryController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      return res.status(401).json('usted debe ser un proveedor');
    }

    const { date } = req.query;
    console.log(date);
    const parsedDate = parseISO(date);
    const startDay = startOfDay(parsedDate);

    const endDay = endOfDay(parsedDate);

    const appointments = await Appointment.findAll({
      where: [
        {
          provider_id: req.userId,
          canceled_at: null,
          date: {
            [Op.between]: [startDay, endDay],
          },
        },
      ],
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new CalendaryController();

// console.log('aqui mi logs -- here my logs');

// console.log(date);
// console.log('the date from req');
// console.log(isValid(date));
// console.log('the date using parseiso');
// console.log(isValid(parsedDate));
// console.log(new Date());
// const st = toString(date);
// const test = parseInt(st, 2);
// console.log(test);
