import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authconfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ err: 'error de validacoin' });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json('el usuario no existe');
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'contraseha invalida' });
    }

    const { id, name } = user;
    const { secret, expiresIn } = authconfig;

    return res.status(200).json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, secret, {
        expiresIn,
      }),
    });
  }
}

export default new SessionController();
