const Expert = require('../models/Expert');

exports.getExpertsNearMe = async (req, res) => {
    // 1. Get coordinates from query parameters
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    try {
        // 2. Run the $geoNear aggregation
        const experts = await Expert.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distanceInMeters", // New field added to results
                    maxDistance: 50000, // 50km (roughly 31 miles)
                    spherical: true,
                    query: { /* Optional: add filters like status: 'active' */ }
                }
            }
        ]);

        // 3. Convert meters to miles for the frontend
        const results = experts.map(expert => ({
            ...expert,
            distanceInMiles: (expert.distanceInMeters / 1609.34).toFixed(1)
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Server error during search." });
    }
};