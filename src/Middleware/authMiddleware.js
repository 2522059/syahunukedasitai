const { getAuth } = require("firebase-admin/auth");

module.exports = async (req, res, next) => {

    try {

        const token = req.headers.authorization?.split("Bearer ")[1];

        if (!token) {

            return res.status(401).json({

                message: "Unauthorized"

            });

        }

        const decoded = await getAuth().verifyIdToken(token);

        req.user = decoded;

        next();

    } catch (err) {

        res.status(401).json({

            message: "Invalid Token"

        });

    }

};