import * as ai from '../services/ai.service.js';


export const getResult = async (req , res ) => {
    try{
        const {prompt} =req.query;
        const  result = await ai.generateResult(prompt);
       console.log("Final Gemini response:", result);

        res.send (result);
    } catch (error){
        console.error("Gemini API Error:", error);
        res.status(500).send({message: error.message});
    }
}