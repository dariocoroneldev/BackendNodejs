import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const users = await User.findAll();
    return res.json(users);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      repeatPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ err: 'error de validacoin' });
    }

    try {
      const userExists = await User.findOne({
        where: { email: req.body.email },
      });
      if (userExists) {
        return res
          .status(400)
          .json({ msg: 'Este correo ya se encuentra registrado!' });
      }
      const { id, name, email, provider, whatsapp } = await User.create(
        req.body
      );

      return res.json({
        id,
        name,
        email,
        provider,
        whatsapp,
      });
    } catch (error) {
      return res.json(error);
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      repeatPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ err: 'error de validacoin' });
    }

    const { email, oldPassword, whatsapp } = req.body;
    const user = await User.findByPk(req.userId);
    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'el usuario ya existe' });
      }
    }
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json('contrsasenha actual no valida');
    }

    // if (whatsapp) {
    //   const WhatsappExists = await User.findOne({ where: { whatsapp } });
    //   if (WhatsappExists) {
    //     return res
    //       .status(401)
    //       .json('usted a ingresado el mismo numero de siempre');
    //   }
    // }

    const { id, name, provider } = await user.update(req.body);
    return res.status(200).json({
      id,
      name,
      email,
      provider,
      whatsapp,
    });
  }
}

export default new UserController();
