module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    }),

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('users', 'avatar_id');
  },
};
