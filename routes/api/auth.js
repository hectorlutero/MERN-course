const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')

const User = require('../../models/User')

// @route   GET   api/auth
// @desc    Test  route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId).select('-password')
        res.json(user)
    } catch(err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})



module.exports = router