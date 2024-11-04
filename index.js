import express from "express";
import cors from 'cors';
import mysql from 'mysql2';

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog'
}).promise();


app.get('/posts', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM posts');
        res.status(200).json(rows);
    } catch (error) {
        console.error(`Error retrieving posts: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post('/posts', async (req, res) => {
    try {
        const { title, content, author, category } = req.body;

        if (!title || title.length < 1) {
            return res.status(400).json({ error: "Title must have at least 1 character" });
        }
        if (!content || content.length < 1) {
            return res.status(400).json({ error: "Content must have at least 1 character" });
        }
        if (!author || author.length < 1) {
            return res.status(400).json({ error: "Author must have at least 1 character" });
        }

        await db.query('INSERT INTO posts (title, content, author,category) VALUES (?, ?, ?,?)', [title, content, author, category]);
        res.status(201).json({ message: 'Post successfully added!' });
    } catch (error) {
        console.error(`Error adding post: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.delete('/posts/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const [result] = await db.query('DELETE FROM posts WHERE id = ?', [postId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.status(200).json({ message: "Post successfully removed" });
    } catch (error) {
        console.error(`Error deleting post: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get('/posts/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
        if (rows.length === 1) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error(`Error retrieving post: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.put('/posts/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const { title, content, author } = req.body;

        const [result] = await db.query('UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?',
            [title, content, author, postId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.status(200).json({ message: "Post successfully updated" });
    } catch (error) {
        console.error(`Error updating post: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});