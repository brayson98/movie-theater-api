const express = require("express");
const router = express.Router();
const {User, Show} = require("../models/index");
const {check, validationResult} = require("express-validator");

router.get("/", async (req, res) => {
    try {
        const data = await User.findAll();
        res.json(data)
    } catch (err) {
        res.status(500).json({error: "An error whilst fetching Users"})
        console.error(err)
    }
});

router.get("/:id", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    res.json(user);
});

router.get("/:id/shows", async (req, res) => {
    try {       
        const user = await User.findByPk(req.params.id, {
            include: {
                model: Show,
                attributes: ['id', 'title', 'genre','rating', 'available']
            }
        });
        if (!user) {
            return res.sendStatus(404).json({error: "User not found"})
        } 
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve user" });
        console.error(err);
    }
})

router.put("/:userId/shows/:showId", async (req, res) => {
    try {
        const {userId, showId} = req.params;

        const user = await User.findByPk(userId);
        const show = await Show.findByPk(showId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!show) {
            return res.status(404).json({ error: "Show not found" });
        }

        await user.addShow(show);
        res.json({ message: `User ${userId} is now associated with show ${showId}` });
    } catch (err) {
        res.status(500).json({ error: "Failed to associate user with show" });
        console.error(err);
    }
   
})

module.exports = router;