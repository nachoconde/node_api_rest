exports.getPost = (req, res, next) => {
    console.log('feed/post');
    res.status(200).json( {
        posts:[
            {title: 'Prueba de titulo',
             content: 'este es el contenido',
             imageUrl: 'images/crossfit.jpg'  }
        ]
    }) 
};


//cada post title, author, image, content

exports.postPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        message: 'post created',
        post: { title: title, content: content }

    })
};
