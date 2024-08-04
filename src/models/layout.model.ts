import mongoose , { Document, Model } from "mongoose";

interface FaqItem extends Document {
    question: string
    answer: string
}

interface Category extends Document {
    title: string
}

interface BannerImage extends Document {
    public_id: string
    url: string
}

interface Layout extends Document {
    type: string
    faq: FaqItem[]
    categories: Category[]
    banner: {
        image: BannerImage
        title: string
        subTitle: string
    }
}

const faqSchema = new mongoose.Schema<FaqItem>({
    question: { type: String},
    answer: { type: String }
})

const categorySchema = new mongoose.Schema<Category>({
    title: { type: String }
})

const bannerImageSchema = new mongoose.Schema<BannerImage>({
    public_id: { type: String },
    url: { type: String }
})


const layoutSchema = new mongoose.Schema<Layout>({
    type: { type: String },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: { type: String },
        subTitle: { type: String }
    }
})

const Layout = mongoose.model<Layout>("Layout", layoutSchema)

export default Layout