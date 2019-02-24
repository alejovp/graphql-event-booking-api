const bcrypt = require('bcryptjs');

const User = require('../../models/user');


module.exports = {
    // resolvers list
    createUser: async args => {
        const { email, password } = args.userInput;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email supplied already exist!');
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                email,
                password: hashedPassword
            });
            
            const result = await user.save();

            return { ...result._doc, password: null };

        } catch (error) {
            throw error;
        };
    }
}