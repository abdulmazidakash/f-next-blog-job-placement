import mongoose from 'mongoose';

let initialized = false;

export const connect = async()=>{
	mongoose.set('strictQuery', true);

	if(initialized){
		console.log('already connected to mongodb');
		return;
	}
	try{
		await mongoose.connect(process.env.MONGODB_URI, {
			dbName: 'next-blog',
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('connected to mongodb');
		initialized = true;
	}catch(error){
		console.log('error connecting to mongodb', error);
	}
}

