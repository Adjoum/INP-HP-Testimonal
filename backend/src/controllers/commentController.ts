import { Response } from 'express';
import Comment from '../models/Comment';
import Testimonial from '../models/Testimonial';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// @desc    Créer un nouveau commentaire ou une réponse
// @route   POST /api/comments
// @access  Private
export const createComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { testimonialId, parentCommentId, content } = req.body;
    const userId = req.user?._id;

    // Validation
    if (!content || content.trim().length < 1) {
      res.status(400).json({
        success: false,
        message: 'Le contenu est requis',
      });
      return;
    }

    if (!testimonialId || !mongoose.Types.ObjectId.isValid(testimonialId)) {
      res.status(400).json({
        success: false,
        message: 'ID de témoignage invalide',
      });
      return;
    }

    // Vérifier que le témoignage existe
    const testimonialExists = await Testimonial.exists({ _id: testimonialId });
    if (!testimonialExists) {
      res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      });
      return;
    }

    // Vérifier la profondeur si c'est une réponse
    let depth = 0;
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de commentaire parent invalide',
        });
        return;
      }

      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        res.status(404).json({
          success: false,
          message: 'Commentaire parent non trouvé',
        });
        return;
      }

      depth = parentComment.depth + 1;

      // Limiter la profondeur à 10 niveaux
      if (depth > 10) {
        res.status(400).json({
          success: false,
          message: 'Profondeur maximale de réponses atteinte',
        });
        return;
      }
    }

    const comment = await Comment.create({
      author: userId,
      testimonial: testimonialId,
      parentComment: parentCommentId || null,
      content: content.trim(),
      depth,
    });

    // Peupler les informations de l'auteur
    await comment.populate('author', 'name avatar promotion verified');

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    console.error('❌ Erreur createComment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création du commentaire',
    });
  }
};

// @desc    Obtenir les commentaires d'un témoignage
// @route   GET /api/comments/testimonial/:testimonialId
// @access  Public
export const getCommentsByTestimonial = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { testimonialId } = req.params;
    const userId = req.user?._id;

    console.log('🔍 Récupération des commentaires pour:', testimonialId);

    // Validation de l'ID
    if (!testimonialId || !mongoose.Types.ObjectId.isValid(testimonialId)) {
      console.error('❌ ID invalide:', testimonialId);
      res.status(400).json({
        success: false,
        message: 'ID de témoignage invalide',
      });
      return;
    }

    // Vérifier que le témoignage existe
    const testimonialExists = await Testimonial.exists({ _id: testimonialId });
    if (!testimonialExists) {
      console.warn('⚠️ Témoignage non trouvé:', testimonialId);
      res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      });
      return;
    }

    // Récupérer seulement les commentaires de premier niveau (parentComment: null)
    const rootComments = await Comment.find({
      testimonial: testimonialId,
      parentComment: null,
    })
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar promotion verified')
      .lean()
      .exec();

    console.log(`✅ ${rootComments.length} commentaires racines trouvés`);

    // Fonction récursive pour charger les réponses
    const loadRepliesRecursive = async (
      commentId: string,
      currentDepth: number = 0,
      maxDepth: number = 5
    ): Promise<any[]> => {
      if (currentDepth >= maxDepth) {
        return [];
      }

      const replies = await Comment.find({
        parentComment: commentId,
      })
        .sort({ createdAt: 1 })
        .populate('author', 'name avatar promotion verified')
        .lean()
        .exec();

      // Charger récursivement les réponses de chaque réponse
      const repliesWithSubReplies = await Promise.all(
        replies.map(async (reply: any) => {
          const subReplies = await loadRepliesRecursive(
            reply._id.toString(),
            currentDepth + 1,
            maxDepth
          );

          return {
            ...reply,
            replies: subReplies,
            likedByUser: userId
              ? reply.likes.some((like: any) => like.toString() === userId.toString())
              : false,
          };
        })
      );

      return repliesWithSubReplies;
    };

    // Charger les réponses pour chaque commentaire racine
    const commentsWithReplies = await Promise.all(
      rootComments.map(async (comment: any) => {
        const replies = await loadRepliesRecursive(comment._id.toString());

        return {
          ...comment,
          replies,
          likedByUser: userId
            ? comment.likes.some((like: any) => like.toString() === userId.toString())
            : false,
        };
      })
    );

    console.log('✅ Commentaires avec réponses chargés');

    res.status(200).json({
      success: true,
      data: commentsWithReplies,
      count: commentsWithReplies.length,
    });
  } catch (error: any) {
    console.error('❌ Erreur getCommentsByTestimonial:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commentaires',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Liker/Unliker un commentaire
// @route   POST /api/comments/:id/like
// @access  Private
export const toggleLikeComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const commentId = req.params.id;

    console.log('❤️ Toggle like:', { userId, commentId });

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400).json({
        success: false,
        message: 'ID de commentaire invalide',
      });
      return;
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé',
      });
      return;
    }

    // Vérifier si l'utilisateur a déjà liké
    const likeIndex = comment.likes.findIndex(
      (like) => like.toString() === userId?.toString()
    );

    let action: 'liked' | 'unliked';

    if (likeIndex > -1) {
      // Unliker
      comment.likes.splice(likeIndex, 1);
      action = 'unliked';
    } else {
      // Liker
      comment.likes.push(userId as any);
      action = 'liked';
    }

    comment.likesCount = comment.likes.length;
    await comment.save();

    console.log(`✅ ${action}:`, comment.likesCount);

    res.status(200).json({
      success: true,
      data: {
        action,
        likesCount: comment.likesCount,
        likedByUser: action === 'liked',
      },
    });
  } catch (error: any) {
    console.error('❌ Erreur toggleLikeComment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors du like/unlike',
    });
  }
};

// @desc    Supprimer un commentaire
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const commentId = req.params.id;

    console.log('🗑️ Suppression commentaire:', commentId);

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400).json({
        success: false,
        message: 'ID de commentaire invalide',
      });
      return;
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé',
      });
      return;
    }

    // Vérifier que l'utilisateur est l'auteur
    if (comment.author.toString() !== userId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce commentaire',
      });
      return;
    }

    // Supprimer récursivement toutes les réponses
    const deleteRepliesRecursive = async (parentId: string) => {
      const replies = await Comment.find({ parentComment: parentId });
      
      for (const reply of replies) {
        // Supprimer les réponses de cette réponse
        await deleteRepliesRecursive((reply._id as mongoose.Types.ObjectId).toString()); //await deleteRepliesRecursive((reply._id as any).toString());
        // Supprimer la réponse elle-même
        await reply.deleteOne();
      }
    };

    // Supprimer toutes les réponses
    await deleteRepliesRecursive(commentId);
    
    // Supprimer le commentaire principal
    await comment.deleteOne();

    console.log('✅ Commentaire supprimé avec toutes ses réponses');

    res.status(200).json({
      success: true,
      message: 'Commentaire supprimé avec succès',
    });
  } catch (error: any) {
    console.error('❌ Erreur deleteComment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
    });
  }
};




















/*import { Response } from 'express';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/auth';

// Fonction récursive pour peupler les réponses
const populateReplies = async (comment: any, maxDepth: number = 5): Promise<any> => {
  if (comment.depth >= maxDepth) {
    return comment;
  }

  await comment.populate({
    path: 'replies',
    populate: {
      path: 'author',
      select: 'name avatar promotion verified',
    },
  });

  if (comment.replies && comment.replies.length > 0) {
    for (let reply of comment.replies) {
      await populateReplies(reply, maxDepth);
    }
  }

  return comment;
};

// @desc    Créer un nouveau commentaire ou une réponse
// @route   POST /api/comments
// @access  Private
export const createComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { testimonialId, parentCommentId, content } = req.body;
    const userId = req.user?._id;

    // Vérifier la profondeur si c'est une réponse
    let depth = 0;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        res.status(404).json({
          success: false,
          message: 'Commentaire parent non trouvé',
        });
        return;
      }
      depth = parentComment.depth + 1;
    }

    const comment = await Comment.create({
      author: userId,
      testimonial: testimonialId,
      parentComment: parentCommentId || null,
      content,
      depth,
    });

    // Peupler les informations de l'auteur
    await comment.populate('author', 'name avatar promotion verified');

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création du commentaire',
    });
  }
};

// @desc    Obtenir les commentaires d'un témoignage
// @route   GET /api/comments/testimonial/:testimonialId
// @access  Public
export const getCommentsByTestimonial = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { testimonialId } = req.params;
    const userId = req.user?._id;

    // Récupérer seulement les commentaires de premier niveau
    const comments = await Comment.find({
      testimonial: testimonialId,
      parentComment: null,
    })
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar promotion verified')
      .lean();

    // Peupler récursivement les réponses
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment: any) => {
        const populatedComment = await Comment.findById(comment._id)
          .populate('author', 'name avatar promotion verified')
          .lean();
        
        return await populateReplies(populatedComment, 5);
      })
    );

    // Ajouter l'information si l'utilisateur a liké chaque commentaire
    const addLikeInfo = (comment: any): any => {
      const likedByUser = userId
        ? comment.likes.some((like: any) => like.toString() === userId.toString())
        : false;

      const processedComment = {
        ...comment,
        likedByUser,
      };

      if (comment.replies && comment.replies.length > 0) {
        processedComment.replies = comment.replies.map((reply: any) => addLikeInfo(reply));
      }

      return processedComment;
    };

    const commentsWithLikeInfo = commentsWithReplies.map((comment: any) =>
      addLikeInfo(comment)
    );

    res.status(200).json({
      success: true,
      data: commentsWithLikeInfo,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des commentaires',
    });
  }
};

// @desc    Liker/Unliker un commentaire
// @route   POST /api/comments/:id/like
// @access  Private
export const toggleLikeComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé',
      });
      return;
    }

    // Vérifier si l'utilisateur a déjà liké
    const likeIndex = comment.likes.findIndex(
      (like) => like.toString() === userId?.toString()
    );

    let action: 'liked' | 'unliked';

    if (likeIndex > -1) {
      // Unliker
      comment.likes.splice(likeIndex, 1);
      action = 'unliked';
    } else {
      // Liker
      comment.likes.push(userId as any);
      action = 'liked';
    }

    comment.likesCount = comment.likes.length;
    await comment.save();

    res.status(200).json({
      success: true,
      data: {
        action,
        likesCount: comment.likesCount,
        likedByUser: action === 'liked',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors du like/unlike',
    });
  }
};

// @desc    Supprimer un commentaire
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé',
      });
      return;
    }

    // Vérifier que l'utilisateur est l'auteur
    if (comment.author.toString() !== userId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce commentaire',
      });
      return;
    }

    // Supprimer aussi toutes les réponses (récursif)
    const deleteReplies = async (commentId: string) => {
      const replies = await Comment.find({ parentComment: commentId });
      for (const reply of replies) {
        await deleteReplies((reply._id as any).toString());
        await reply.deleteOne();
      }
    };

    await deleteReplies((comment._id as any).toString());
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Commentaire supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
    });
  }
};  */
