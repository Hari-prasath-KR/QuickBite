import Feedback from "../models/feedBack.js";
import mongoose from "mongoose";
import Catering from "../models/catering.js";

export const feedbackList = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(limit).populate("userId", "name");
    const avg = await Feedback.aggregate([ { $group: { _id: null, avgRating: { $avg: "$rating" } } } ]);
    return res.json({ averageRating: (avg[0] && avg[0].avgRating) || 0, feedbacks });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const { cateringId, rating, comment } = req.body;
    console.log(req.user);
    console.log(req.body);
    if (!rating || !cateringId) {
      return res.status(400).json({ message: "Rating and Catering ID required" });
    }

    const catering = await Catering.findById(cateringId);
    if (!catering) {
      return res.status(404).json({ message: "Catering not found. Cannot give feedback." });
    }

    // if (catering.status !== "available") {
    //   return res.status(400).json({ message: "Feedback can only be given to available caterings." });
    // }
    console.log(req.body);
    const feedback = new Feedback({
      userId: req.user.id,
      cateringId,
      rating,
      comment,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
