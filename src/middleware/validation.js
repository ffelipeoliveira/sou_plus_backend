const { body, validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        
        res.status(400).json({
            message: 'Validation error',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    };
};

const userValidation = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be 3-50 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
            .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
            .withMessage('Password must contain at least one letter and one number'),
        body('fullName')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Full name must be 2-100 characters')
    ],
    
    login: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    
    message: [
        body('content')
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage('Message must be 1-5000 characters'),
        body('receiverId')
            .isInt({ min: 1 })
            .withMessage('Valid receiver ID is required')
    ],
    
    updateProfile: [
        body('fullName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Full name must be 2-100 characters'),
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be 3-50 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('profilePicture')
            .optional()
            .isURL()
            .withMessage('Profile picture must be a valid URL')
    ]
};

module.exports = { validate, userValidation };