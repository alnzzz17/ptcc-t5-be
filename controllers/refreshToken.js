import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log({ refreshToken })
        if (!refreshToken) return res.sendStatus(401);
        console.log("sudah lewat 401 di authcontroller")
        const user = await User.findOne({
                where: { refreshToken }
        });
        if (!user.refreshToken) return res.sendStatus(403);
        else jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded) => {
            if (err) return res.sendStatus(403);
            console.log("sudah lewat 403 ke dua di controller")
            const userPlain = user.toJSON(); // Konversi ke object
            const { password: _, refreshToken: __, ...safeUserData } = userPlain;
            const accessToken = jwt.sign(safeUserData, process.env.ACCESS_SECRET_KEY, {
                expiresIn: '30s'
            });
            res.json({ accessToken });
        });
    } catch (error) {
        console.log(error);
    }
}

export default refreshToken;