import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authconfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json('usuario no autorizado');
  }

  const [, token] = authHeader.split(' ');
  console.log(authHeader);

  try {
    const decoded = await promisify(jwt.verify)(token, authconfig.secret);
    req.userId = decoded.id;
    console.log(decoded);
  } catch (err) {
    return res.status(401).json('token no valido');
  }

  return next();
};
