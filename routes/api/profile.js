const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route   GET   api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id
        const profile = await Profile.findOne({ user: userId }).populate('user', ['name', 'avatar'])

        if(!profile) {
            return res.status(404).json({ msg: 'There\'s no profile for this user' })
        }
        res.json(profile)
    } catch (error) {
        console.log(error.message)
        res
            .status(500)
            .send('Server Error')
    }
})

// @route   POST   api/profile/
// @desc    Create or Update user profile
// @access  Private
router.post(
    '/', 
    [ 
        auth,   
        [
            check('status', 'Status is required' )
                .not()
                .isEmpty(),
            check('skills', 'Skills is required' )
                .not()
                .isEmpty()
        ] 
    ], 
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res
                    .status(400)
                    .json({ 
                        errors: errors.array()
                    })
        }

        // destructure the request
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook,
        } = req.body;

        // Build profile object
        const profileFields = {}

        profileFields.user = req.user.id
        if(company)         profileFields.company   = company
        if(website)         profileFields.website   = website
        if(location)        profileFields.location  = location
        if(bio)             profileFields.bio       = bio
        if(status)          profileFields.status    = status
        if(githubusername)  profileFields.githubusername = githubusername
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }

        // Build social object
        profileFields.social = {}

        if(youtube)     profileFields.social.youtube    = youtube
        if(twitter)     profileFields.social.twitter    = twitter
        if(instagram)   profileFields.social.instagram  = instagram
        if(linkedin)    profileFields.social.linkedin   = linkedin
        if(facebook)    profileFields.social.facebook   = facebook

        try {
            let profile = await Profile.findOne({ user: req.user.id })
            if(profile) {
                // Update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields },
                    { new: true }
                )

                return res.json(profile)
            }

            // Create
            profile = new Profile(profileFields)
            await profile.save()

            res.json(profile)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }

})

// @route   GET   api/profile/
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
         res.json(profiles)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET   api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id
        const profile = await Profile
            .findOne({ user: userId })
            .populate('user', ['name', 'avatar'])

        if(!profile) return res.status(400).json({
            msg: 'Profile not found'
        })    
         res.json(profile)
    } catch (error) {
        console.error(error.message)
        if(error.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'Profile not found'
            })  
        }
        res.status(500).send('Server Error')
    }
})

// @route   DELETE   api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts

        // Remove Profile
        const userId = req.user.id
        await Profile.findOneAndRemove({ user: userId })
        await User.findOneAndRemove({ _id: userId })
        res.json({ msg: 'User removed as well as its posts and profile'})
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

// @route   PUT   api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
    '/experience', 
    [
        auth, 
        [
            check('title', 'Title is required')
            .not()
            .isEmpty(),
            check('company', 'Company is required')
            .not()
            .isEmpty(),
            check('from', 'From is required')
            .not()
            .isEmpty(),
        ]
    ], async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id })

            profile.experience.unshift(newExp)
            await profile.save()

            res.json(profile)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
})

// @route   PUT   api/profile/experience/:exp_id
// @desc    Update profile experience
// @access  Private
router.put(
    '/experience/:exp_id',
    [
        auth, 
        [
            check('title', 'Title is required')
            .not()
            .isEmpty(),
            check('company', 'Company is required')
            .not()
            .isEmpty(),
            check('from', 'From is required')
            .not()
            .isEmpty(),
        ]
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const {
                title,
                company,
                location,
                from,
                to,
                current,
                description
            } = req.body
    
            const updateExp = {
                title,
                company,
                location,
                from,
                to,
                current,
                description
            }
            
            // Get the exp_id and finding the proper user
            const expId = req.params.exp_id
            const profile = await Profile.findOne({ user: req.user.id })
            
            // Get the array index of experience and substitute it for the new one
            const getIndex = profile.experience
                .map(item => item.id)
                .indexOf(expId)
            profile.experience.splice(getIndex, 1, updateExp)

            await profile.save()

            res.json(profile.experience)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
    })


// @route   GET   api/profile/experience/:exp_id
// @desc    Remove profile experience
// @access  Private
router.get(
    '/experience/:exp_id',
    async (req, res) => {
        try {
            const expId = req.params.exp_id
            const profile = await Profile.findOne({ experience: expId })

            res.json(profile)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
    })

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private
router.delete(
    '/experience/:exp_id', auth,
    async (req, res) => {
        try {

            const expId = req.params.exp_id
            const profile = await Profile.findOne({ user: req.user.id })

            // Get remove index
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(expId)

            profile.experience.splice(removeIndex, 1)

            await profile.save()

            res.json(profile)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
    })

// @route   PUT   api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
    '/education', 
    [
        auth, 
        [
            check('school', 'School is required')
            .not()
            .isEmpty(),
            check('degree', 'Degree is required')
            .not()
            .isEmpty(),
            check('fieldofstudy', 'Field of study is required')
            .not()
            .isEmpty(),
        ]
    ], async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body

        const newExp = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id })

            profile.education.unshift(newExp)
            await profile.save()

            res.json(profile)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
})

// @route   PUT   api/profile/education/:edu_id
// @desc    Update profile education
// @access  Private
router.put(
    '/education/:edu_id',
    [
        auth, 
        [
            check('school', 'School is required')
            .not()
            .isEmpty(),
            check('degree', 'Degree is required')
            .not()
            .isEmpty(),
            check('fieldofstudy', 'Field of study is required')
            .not()
            .isEmpty(),
        ]
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const {
                school,
                degree,
                fieldofstudy,
                from,
                to,
                current,
                description
            } = req.body
    
            const updateEdu = {
                school,
                degree,
                fieldofstudy,
                from,
                to,
                current,
                description
            }
            
            // Get the edu_id and finding the proper user
            const eduId = req.params.edu_id
            const profile = await Profile.findOne({ user: req.user.id })
            
            // Get the array index of education and substitute it for the new one
            const getIndex = profile.education
                .map(item => item.id)
                .indexOf(eduId)
            profile.education.splice(getIndex, 1, updateEdu)

            await profile.save()

            res.json(profile.education)
        } catch (error) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }
    })


// @route   GET   api/profile/education/:edu_id
// @desc    Remove profile education
// @access  Private
router.get(
    '/education/:edu_id',
    async (req, res) => {
        try {
            const eduId = req.params.edu_id
            const profile = await Profile.findOne({ education: eduId })

            res.json(profile.education)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
    })

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete profile education
// @access  Private
router.delete(
    '/education/:edu_id', auth,
    async (req, res) => {
        try {

            const eduId = req.params.edu_id
            const profile = await Profile.findOne({ user: req.user.id })

            // Get remove index
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(eduId)

            profile.education.splice(removeIndex, 1)

            await profile.save()

            res.json(profile)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
    })



module.exports = router