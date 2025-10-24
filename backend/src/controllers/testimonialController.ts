import { Response } from 'express';
import Testimonial from '../models/Testimonial';
import { AuthRequest } from '../middleware/auth';

// @desc    Créer un nouveau témoignage
// @route   POST /api/testimonials
// @access  Private
export const createTestimonial = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = req.user?._id;

    const testimonial = await Testimonial.create({
      author: userId,
      content,
    });

    // Peupler les informations de l'auteur
    await testimonial.populate('author', 'name avatar promotion verified');

    res.status(201).json({
      success: true,
      data: testimonial,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création du témoignage',
    });
  }
};

// @desc    Obtenir tous les témoignages
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { sort = 'recent', search = '', page = 1, limit = 10 } = req.query;

    // Construire la requête de recherche
    const query: any = {};
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    // Définir le tri
    let sortOption: any = { createdAt: -1 }; // Par défaut: récents

    if (sort === 'popular') {
      sortOption = { likesCount: -1, createdAt: -1 };
    } else if (sort === 'commented') {
      sortOption = { commentsCount: -1, createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Récupérer les témoignages
    const testimonials = await Testimonial.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('author', 'name avatar promotion verified')
      .lean();

    // Ajouter l'information si l'utilisateur a liké
    const userId = req.user?._id;
    const testimonialsWithLikeInfo = testimonials.map((testimonial: any) => ({
      ...testimonial,
      likedByUser: userId
        ? testimonial.likes.some((like: any) => like.toString() === userId.toString())
        : false,
    }));

    // Compter le total de témoignages
    const total = await Testimonial.countDocuments(query);

    res.status(200).json({
      success: true,
      data: testimonialsWithLikeInfo,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des témoignages',
    });
  }
};

// @desc    Obtenir un témoignage par ID
// @route   GET /api/testimonials/:id
// @access  Public
export const getTestimonialById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('author', 'name avatar promotion verified')
      .lean();

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      });
      return;
    }

    // Ajouter l'information si l'utilisateur a liké
    const userId = req.user?._id;
    const testimonialWithLikeInfo = {
      ...testimonial,
      likedByUser: userId
        ? (testimonial as any).likes.some((like: any) => like.toString() === userId.toString())
        : false,
    };

    res.status(200).json({
      success: true,
      data: testimonialWithLikeInfo,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du témoignage',
    });
  }
};

// @desc    Liker/Unliker un témoignage
// @route   POST /api/testimonials/:id/like
// @access  Private
export const toggleLikeTestimonial = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const testimonialId = req.params.id;

    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      });
      return;
    }

    // Vérifier si l'utilisateur a déjà liké
    const likeIndex = testimonial.likes.findIndex(
      (like) => like.toString() === userId?.toString()
    );

    let action: 'liked' | 'unliked';

    if (likeIndex > -1) {
      // Unliker
      testimonial.likes.splice(likeIndex, 1);
      action = 'unliked';
    } else {
      // Liker
      testimonial.likes.push(userId as any);
      action = 'liked';
    }

    testimonial.likesCount = testimonial.likes.length;
    await testimonial.save();

    res.status(200).json({
      success: true,
      data: {
        action,
        likesCount: testimonial.likesCount,
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

// @desc    Supprimer un témoignage
// @route   DELETE /api/testimonials/:id
// @access  Private
export const deleteTestimonial = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      });
      return;
    }

    // Vérifier que l'utilisateur est l'auteur
    if (testimonial.author.toString() !== userId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce témoignage',
      });
      return;
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Témoignage supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
    });
  }
};
