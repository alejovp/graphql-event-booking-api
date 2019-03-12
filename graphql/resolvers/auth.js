const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

const { JWT_KEY } = process.env;


module.exports = {
    // resolvers list
    createUser: async args => {
        const { firstName, lastName, email, password } = args.userInput;
        
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email supplied already exist!');
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword
            });
            
            const result = await user.save();

            return { ...result._doc, password: null };

        } catch (error) {
            throw error;
        };
    },
    login: async ({ email, password }) => {
        const user = await User.findOne({ email });
 
        // Using different error messages here just for debugging (should be the same with no hints!!)
        if (!user) {
            throw new Error('User does not exist!');
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            throw new Error('Wrong password!');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            JWT_KEY, 
            { expiresIn: '1h' }
        );

        return {
            userId: user.id,
            token,
            tokenExpiration: 1
        };
    }
}