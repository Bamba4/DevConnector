import jwt from 'jsonwebtoken';

const auth = (req:any, resp: any, next: any) => {
        const token = req.header('x-auth-token');
        if (!token) {
            return resp.status(401).json({msg: 'Pas de token, vous n\'etes pas authoriser'});
        }
        try {
            const decode: any = jwt.verify(token, 'secretToken');
            req.user = decode.user;
            next();
        }catch (e) {
            resp.status(401).json({msg: 'Token non valide'})
        }
};

export default auth;
