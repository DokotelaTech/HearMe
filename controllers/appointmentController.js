const getAppointments =
async (req,res) => {

    try{

        // DATABASE LOGIC LATER

        return res.status(200).json({

            appointments:[]
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

// CREATE

const createAppointment =
async (req,res) => {

    try{

        const appointmentData =
            req.body;

        // SAVE TO DB LATER

        return res.status(201).json({

            message:
            "Appointment created",

            appointment:
            appointmentData
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

// UPDATE

const updateAppointment =
async (req,res) => {

    try{

        const appointmentId =
            req.params.id;

        const updatedData =
            req.body;

        return res.status(200).json({

            message:
            "Appointment updated",

            appointmentId,

            updatedData
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

// DELETE

const deleteAppointment =
async (req,res) => {

    try{

        const appointmentId =
            req.params.id;

        return res.status(200).json({

            message:
            "Appointment deleted",

            appointmentId
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

module.exports = {

    getAppointments,

    createAppointment,

    updateAppointment,

    deleteAppointment
};