const express = require("express");

const router = express.Router();
const db = require("../data/db")
const imageupload = require("../helpers/image-upload.js")
const fs = require("fs");


router.get("/admin/blog/delete/:blogid", async function(req,res){
    const blogid = req.params.blogid;
    try {
        const [blogs,]=await db.execute("select * from blog where blogid=?",[blogid]);
        const blog = blogs[0];
        res.render("admin/blog-delete",{
            title:"Delete Blog",
            blog:blog
        })
    } catch (err) {
        console.log(err);
    }
})

router.post("/admin/blog/delete/:blogid", async function(req,res){
    const blogid = req.params.blogid;
    try {
        await db.execute("delete from blog where blogid=?", [blogid]);
        res.redirect("/admin/blogs?action=delete");
    } catch (err) {
        console.log(err);
    }
})

//categories delete
router.get("/admin/category/delete/:categoryid", async function(req,res){
    const categoryid = req.params.categoryid;
    try {
        const [categories,]=await db.execute("select * from category where categoryid=?",[categoryid]);
        const category = categories[0];
        res.render("admin/category-delete",{
            title:"Delete Category",
            category: category
        })
    } catch (err) {
        console.log(err);
    }
})

router.post("/admin/category/delete/:categoryid", async function(req,res){
    const categoryid = req.params.categoryid;
    try {
        await db.execute("delete from category where categoryid=?", [categoryid]);
        res.redirect("/admin/categories?action=delete");
    } catch (err) {
        console.log(err);
    }
})



router.get("/admin/blog/create", async function(requset,res){

    try {

        const [categories,]=await db.execute("select * from category");
        res.render("admin/blog-create",{
        title: "Add Blog",
        categories: categories
    });
    } catch (err) {
        console.log(err);
    }
})
router.post("/admin/blog/create" , imageupload.upload.single("resim"), async function(req,res){
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    const resim = req.file.filename;
    const anasayfa = req.body.anasayfa == "on" ? 1:0;
    const onay = req.body.onay == "on" ? 1:0;
    const kategori = req.body.kategori;

    try {
        await db.execute("INSERT INTO blog(baslik,altbaslik,aciklama,resim,anasayfa,onay,categoryid) VALUES (?,?,?,?,?,?,?)",
            [baslik,altbaslik,aciklama,resim,anasayfa,onay,kategori]);
            res.redirect("/admin/blogs?action=create")
    } catch (err) {
        console.log(err);
    }
})

router.get("/admin/category/create",async function(requset,res){

    try {
        res.render("admin/category-create",{
        title: "Add Category",
    });
    } catch (err) {
        console.log(err);
    }
})

router.post("/admin/category/create" , async function(req,res){
    const name = req.body.name;

    try {
        await db.execute("INSERT INTO category(name) VALUES (?)",
            [name]);
            res.redirect("/admin/categories?action=create")
    } catch (err) {
        console.log(err);
    }
})

router.get("/admin/blogs/:blogid",async function(request,res){
    const blogid= request.params.blogid;
    try {
        const [blogs,]=await db.execute("select * from blog where blogid=?",[blogid]);
        const [categories,]=await db.execute("select * from category");
        const blog= blogs[0];
        if (blog)
        {
           return res.render("admin/blog-edit",{
                title:blog.baslik,
                blog:blog,
                categories:categories
            });
        }
        res.redirect("admin/blogs");
    } catch (err) {
        console.log(err);
    }
    
})
router.post("/admin/blogs/:blogid" ,imageupload.upload.single("resim"),async function(req,res){
    const blogid= req.params.blogid;
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    let resim = req.body.resim;
    if(req.file)
    {
        resim = req.file.filename;
        fs.unlink("./public/images/"+req.body.resim,err=>{
            console.log(err);
        })

    }
    const anasayfa = req.body.anasayfa == "on" ? 1:0;
    const onay = req.body.onay == "on" ? 1:0;
    const kategori = req.body.kategori;
    
    try {
        await db.execute("update blog set baslik=?,altbaslik=?,aciklama=?,resim=?,anasayfa=?,onay=?,categoryid=? where blogid=?",
            [baslik,altbaslik,aciklama,resim,anasayfa,onay,kategori,blogid]
        );
        res.redirect("/admin/blogs?action=edit&blogid="+blogid);
    } catch (err) {
        console.log(err);
    }
})

//categories
router.get("/admin/categories/:categoryid",async function(request,res){
    const categoryid= request.params.categoryid;
    try {
        const [categories,]=await db.execute("select * from category where categoryid=?",[categoryid]);
        const category= categories[0];
        if (category)
        {
           return res.render("admin/category-edit",{
                title:category.name,
                category:category
            });
        }
        res.redirect("/admin/categories");
    } catch (err) {
        console.log(err);
    }
    
})
router.post("/admin/categories/:categoryid" ,async function(req,res){
    const categoryid= req.params.categoryid;
    const name = req.body.name;

  

    try {
        await db.execute("update category set name=? where categoryid=?",
            [name,categoryid]
        );
        res.redirect("/admin/categories?action=edit&categoryid="+categoryid);
    } catch (err) {
        console.log(err);
    }
})

router.get("/admin/blogs",async function(requset,res){
    try {
        const [blogs,]=await db.execute("select blogid,baslik,altbaslik,resim from blog");
        res.render("admin/blog-list",{
            title:"Blog List",
            blogs: blogs,
            action: requset.query.action,
            blogid: requset.query.blogid
        });
    } catch (err) {
        console.log(err);
    }
    
})
router.get("/admin/categories",async function(requset,res){
    try {
        const [categories,]=await db.execute("select * from category");
        res.render("admin/category-list",{
            title:"Blog List -Blog APP",
            categories: categories,
            action: requset.query.action,
            categoryid: requset.query.categoryid
        });
    } catch (err) {
        console.log(err);
    }
    
})
module.exports = router;