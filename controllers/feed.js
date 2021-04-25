const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');

const path = require('path');
const fs = require('fs');
const user = require('../models/user');
const io = require('../socket');

//se trae todos los post de la bbdd
exports.getPosts = async (req, res, next) => {
  console.log('GET:feed/posts');
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalIems = await Post.find().countDocuments();

    const posts = await Post.find()
      .populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: 'posts',
      posts: posts,
      totalItems: totalIems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

///Crea post
///
///
exports.postPost = (req, res, next) => {
  console.log('POST:feed/post');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Algún dato introducido es incorrecto');
    error.statusCode = 422; //`podemos nombrarlo como queramos
    throw error; //lanza el error al siguiente error handling -> catch
  }
  if (!req.file) {
    const error = new Error('Falta imagen');
    error.statusCode = 422; //`podemos nombrarlo como queramos
    throw error; //lanza el error al siguiente error handling -> catch
  }

  let creator;
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  post
    .save()
    .then((result) => {
      console.log('post creado ' + result + ' busco al usuario: ' + req.userId);
      return User.findById(req.userId);
    })
    .then((userFound) => {
      creator = userFound;
      userFound.posts.push(post);
      return userFound.save();
    })
    .then((userSaved) => {
      io.getIO().emit('posts', {
        action: 'create',
        post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
      });
      res.status(201).json({
        message: 'created',
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

///Consigue un post único post
///
///
exports.getPost = (req, res, next) => {
  console.log('GET:feed/post');
  console.log('ID GET:feed/post' + req.params.postId);

  const postId = req.params.postId;

  Post.findById(postId)
    .then((result) => {
      if (!result) {
        const error = new Error('post no encontrado');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: 'post conseguido',
        post: result,
      });
    })

    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

///Actualiza un post
///
///
exports.putPost = (req, res, next) => {
  console.log('ID PUT:feed/post' + req.params.postId);

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  let imageUrl = req.body.image; // en el caso de que no cambie la imagen cojo la ruta

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('err' + errors);
    const error = new Error('Algún dato introducido es incorrecto');
    error.statusCode = 422; //`podemos nombrarlo como queramos
    throw error; //lanza el error al siguiente error handling -> catch
  }

  if (req.file) {
    console.log('err' + errors);
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    console.log('err' + errors);
    const error = new Error('Falta imagen');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .populate('creator')
    .then((post) => {
      if (!post) {
        const error = new Error('post no encontrado');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userID) {
        const error = new Error('Este post no es tuyo');
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        borraImagen(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })

    .then((result) => {
      io.getIO().emit('posts', { action: 'update', post: result });
      res.status(200).json({ message: 'Post update', post: result });
    })
    .catch((err) => {
      console.log('err' + err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

///Borra un post
///
///
exports.deletePost = (req, res, next) => {
  console.log('ID delete:feed/post' + req.params.postId);
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      //puedo chequear si es el usuario logeado
      if (!post) {
        const error = new Error('post no encontrado');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Este post no es tuyo');
        error.statusCode = 403;
        throw error;
      }
      borraImagen(post.imageUrl);

      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Post borrado' });
    })
    .catch((err) => {
      console.log('err' + err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const borraImagen = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
