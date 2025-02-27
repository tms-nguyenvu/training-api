class UserController {

    getAllUser = async (req, res) => {
        return res.json(await UserService.getAllUsers());
    }
}

module.exports = new UserController();