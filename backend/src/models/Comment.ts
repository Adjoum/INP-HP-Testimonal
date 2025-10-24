import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  author: mongoose.Types.ObjectId;
  testimonial: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  repliesCount: number;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'auteur est requis'],
    },
    testimonial: {
      type: Schema.Types.ObjectId,
      ref: 'Testimonial',
      required: [true, 'Le témoignage est requis'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
      trim: true,
      minlength: [1, 'Le commentaire doit contenir au moins 1 caractère'],
      maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères'],
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    depth: {
      type: Number,
      default: 0,
      max: [10, 'La profondeur maximale est de 10 niveaux'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour améliorer les performances
commentSchema.index({ testimonial: 1, parentComment: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1 });

// Virtual pour obtenir les réponses
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
});

// Hook pour mettre à jour le compteur de commentaires du témoignage
commentSchema.post('save', async function () {
  try {
    const Testimonial = mongoose.model('Testimonial');
    
    // Mettre à jour le compteur de commentaires du témoignage
    const totalComments = await mongoose.model('Comment').countDocuments({
      testimonial: this.testimonial,
    });
    
    await Testimonial.findByIdAndUpdate(this.testimonial, {
      commentsCount: totalComments,
    });

    // Si c'est une réponse, mettre à jour le compteur du commentaire parent
    if (this.parentComment) {
      const repliesCount = await mongoose.model('Comment').countDocuments({
        parentComment: this.parentComment,
      });
      
      await mongoose.model('Comment').findByIdAndUpdate(this.parentComment, {
        repliesCount,
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des compteurs:', error);
  }
});

// Hook pour calculer la profondeur lors de la création
commentSchema.pre('save', async function (next) {
  if (this.isNew && this.parentComment) {
    try {
      const parentComment = await mongoose
        .model('Comment')
        .findById(this.parentComment);
      
      if (parentComment) {
        this.depth = parentComment.depth + 1;
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la profondeur:', error);
    }
  }
  next();
});

export default mongoose.model<IComment>('Comment', commentSchema);
