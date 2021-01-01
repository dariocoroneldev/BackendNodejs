class NotificationController {
  async index(req, res) {
    return res.status(200).json('ok');
  }
}

export default new NotificationController();
