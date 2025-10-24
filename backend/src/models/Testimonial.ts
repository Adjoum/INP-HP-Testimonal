import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'auteur est requis'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
      trim: true,
      minlength: [10, 'Le témoignage doit contenir au moins 10 caractères'],
      maxlength: [1000, 'Le témoignage ne peut pas dépasser 1000 caractères'],
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
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour améliorer les performances des requêtes
testimonialSchema.index({ author: 1, createdAt: -1 });
testimonialSchema.index({ likesCount: -1 });
testimonialSchema.index({ commentsCount: -1 });
testimonialSchema.index({ createdAt: -1 });

// Virtual pour obtenir les commentaires
testimonialSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'testimonial',
  match: { parentComment: null }, // Seulement les commentaires de premier niveau
});

export default mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
