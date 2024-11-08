const express = require("express");
const router = express.Router();
const {User, Show} = require("../models/index");
const {check, validationResult} = require("express-validator");


router.get("/", async (req, res) => {
    try {
        const data = await Show.findAll();
        res.json(data)
    } catch (err) {
        res.status(500).json({error: "An error whilst fetching shows"})
        console.error(err);
    }
});

router.get("/:id", async (req, res) => {
    const show = await Show.findByPk(req.params.id);
    res.json(show);
});

router.get("/:id/users", async (req, res) => {
    try {
        const show = await Show.findByPk(req.params.id, {
            include: {
                model: User, 
                attributes: ['id', 'username']
            }
        })
        if (!show) {
            return res.sendStatus(404).json({error: "Show not found"})
        }
        res.json(show)
    } catch (err) {
        res.status(500).json({error: "Failed to retrieve show"})
        console.error(err)
    }
});
router.put("/:id/available", async (req, res) => {
    try {
        const show = await Show.findByPk(req.params.id);
        if (!show) {
            return res.status(404).json({ error: "Show not found" });
        }
        show.available = !show.available;

        // Save the updated show
        await show.save();
        res.json(show)

    } catch(err) {
        res.status(500).json({ error: "Failed to update show" });
        console.error(err);
    }
})

router.delete("/:id", async (req, res) => {
    try {
        let show = await Show.findByPk(req.params.id);
        if (!show) return res.sendStatus(404);
        show = await show.destroy()
        res.send(show)
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
      }
})

router.get("/:genre", async (req, res) => {
    try {
        const shows = await Show.findAll({
            where: {genre: req.params.genre}
        });
        if (shows.length === 0) {
            return res.status(404).json({ error: "No shows found for this genre" });
        }
        res.json(shows)
    } catch(err) {
        res.status(500).json({ error: "Failed to retrieve shows" });
        console.error(err);
    }
})

module.exports = router;