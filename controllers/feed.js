const { validationResult } = require('express-validator')
const Post = require ('../modes')

exports.getPost = (req, res, next) => {

    console.log('GET:feed/post');
    res.status(200).json({
        posts: [
            {
                title: 'Prueba de titulo',
                _id: '111',
                author: "nacho",
                content: 'este es el contenido',
                imageUrl: 'images/crossfit.jpg',
                creator: {
                    name: "nacho",
                },
                createdAt: new Date()
            }
        ]
    })
};


//cada post title, author, image, content

exports.postPost = (req, res, next) => {
    console.log('POST:feed/post');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422)
            .json({
                message: 'Validation failed',
                errors: errors.array()
            })
    }

    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        message: 'created',
        post: {
            _id: new Date().toISOString(),
            title: title,
            content: content,
            creator: { name: 'nacho' },
            createdAt: new Date()
        }
    })
};
