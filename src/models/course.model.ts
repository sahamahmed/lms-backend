import mongoose, {Document} from 'mongoose';
import { IUser } from './user.model';
import { time } from 'console';

export interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies?: any[];
}

export interface IReview extends Document {
    user: IUser
    rating: number
    comment: string
    commentReplies?: any[]
}

interface ILink extends Document {
    title: string
    url: string
}

interface ICourseData extends Document {
    title: string
    description: string
    videoUrl: string
    videoSection: string
    videoLength: number
    videoPlayer: string
    links: ILink[]
    suggestion: string
    questions: IComment[]
}

interface ICourse extends Document {
  _id?: mongoose.Schema.Types.ObjectId 
    name: string
    description: string
    categories:string
    price: number
    estimatedPrice?: number
    thumbnail?: {
        public_id: string
        url: string
    }
    tags: string
    courseData: ICourseData[]
    level: string
    demoUrl: string
    benefits: {title: string}[]
    prerequisites: {title: string}[]
    reviews: IReview[]
    ratings: number
    purchased?: number
}


//SCHEMAS 
const commentSchema: mongoose.Schema<IComment> = new mongoose.Schema<IComment>({
    user: Object,
    question: String,
    questionReplies: [Object]
}, {timestamps: true})

const reviewSchema: mongoose.Schema<IReview> = new mongoose.Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0
    },
    comment: String,
    commentReplies: [Object]
}, {timestamps: true})

const linkSchema: mongoose.Schema<ILink> = new mongoose.Schema<ILink>({
    title: String,
    url: String
})

const courseDataSchema: mongoose.Schema<ICourseData> = new mongoose.Schema<ICourseData>({
    title: String,
    description: String,
    videoUrl: String,
    videoSection: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema]
})

const courseSchema: mongoose.Schema<ICourse> = new mongoose.Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    categories: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatedPrice: {type: Number},
    thumbnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    tags: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    demoUrl: {
      type: String,
      required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);  


const Course: mongoose.Model<ICourse> =  mongoose.model<ICourse>("Course", courseSchema)

export default Course