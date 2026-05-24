const getReports =
async (req,res) => {

    try{

        return res.status(200).json({

            reports:[]
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

const createReport =
async (req,res) => {

    try{

        const {
            category,
            description
        } = req.body;

        return res.status(201).json({

            message:"Report created",

            report:{
                category,
                description
            }
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

module.exports = {

    getReports,

    createReport
};