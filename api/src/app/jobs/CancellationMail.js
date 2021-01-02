import { format, parseISO } from 'date-fns';
import es from 'date-fns/locale/es';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { appointment } = data;
    await Mail.sendMail({
      to: `${appointment.provider.name} < ${appointment.provider.email} >`,
      subject: 'agendamiento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          " 'dia' dd 'de' MMMM', a las 'H:mm' hs'",
          { locale: es }
        ),
      },
    });
  }
}

export default new CancellationMail();
