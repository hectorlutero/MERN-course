const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')

// @route   GET   api/auth
// @desc    Test  route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User
            .findById(userId)
            .select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500)
            .send('Server Error')
    }
})

// @route   POST   api/auth
// @desc    Athenticate  user & get token
// @access  Public

router.post('/',
    [
        check(
            'email',
            'Please enter a valid email address').isEmail(),
        check(
            'password',
            'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ errors: errors.array() })
        }

        // See if user exists
        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({
                        errors: [{ msg: 'Invalid credentials' }]
                    })
            }

            // MATCHING USER AND PASSWORD

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res
                    .status(400)
                    .json({
                        errors: [{ msg: 'Invalid credentials' }]
                    })
            }

            // Return jsonwebtoken

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 3600000 },
                (err, token) => {
                    if (err) throw err
                    res.json({ token })
                })
        } catch (error) {
            console.error(error.message)
            res.status(500)
                .send('Server error')
        }
})


module.exports = router