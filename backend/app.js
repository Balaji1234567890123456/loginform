const express=require("express")
const app=express()
const {open}=require("sqlite")
const sqlite3=require("sqlite3")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const path=require("path")
const dbPath= path.join(__dirname,"userDetails.db")
const cors=require("cors")
app.use(cors())



app.use(express.json())

let db

const initialization= async ()=>{
    try{
    db= await
     open({filename:dbPath,
        driver:sqlite3.Database
    })
    app.listen(3000,()=>{
        console.log("success")
    })
}
catch(e){
    console.log("rejected")
    process.exit(1)
}

}
initialization()
const authentication=(req,res,next)=>{
    const {authorization}=req.headers
    let y

if (authorization!==undefined){
    const h=authorization.split(" ")
    y=h[1]
    if (y===undefined){
        res.send("invalid user")
    }
    else{
        jwt.verify(y,"my_string", async (error,payLoad)=>{
            if (error){
                res.send("hi")
            }
            else{
                req=payLoad
                next()
            }
        })
    }


}
else{
    res.send("invalid user")
}
}
    

    
app.get("/users",authentication,async (req,res)=>{
    const a=`select *
    from userDetails;
    `
    const b=await db.all(a)
    res.send(b)
})
app.post("/register",authentication,async (req,res)=>{
    const {username,email,password}=req.body
    const securePassword=await bcrypt.hash(password,10)
    const b=`insert into userDetails (name,email,password)
    values ("${username}","${email}","${securePassword}");


    `
    const c=await db.run(b)
    res.send("successfully created")
})
app.post("/login", async (req,res)=>{
    const {username,email,password}=req.body
    const a=`select *
    from userDetails
    where name="${username}" and email="${email}";`
    const b=await db.get(a)
    console.log(b)
    if (b===undefined){
        res.send("invalid user")

    }
    else{
        const isPasswordMatched=await bcrypt.compare(password,b.password)
        if (isPasswordMatched){
            const payLoad={username:`${username}`}
            const token=jwt.sign(payLoad,"my_string")
            res.send({jwtToken:token})
        }
        else{
            res.status(400)
            res.send("invalid user")
        }

    }
})
app.put("/update/:email",async (req,res)=>{
    const k=req.body
    const{email}=req.params
    let s=""
    if (k.username!==undefined){
        s="username updated"
    }
    else if (k.hope!==undefined){
        s="email updated"
    }
    else if (k.password!==undefined){
        s="password updated"
    }
    const j=`select *
    from userDetails
    where email="${email}";`
    const p=await db.get(j)
    console.log(p)
    const {username=p.name,hope=p.email,password=p.password}=req.body
    const u=await bcrypt.hash(password,10)
    const q=`update userDetails
    set name="${username}",email="${hope}",password="${u}"
    where email="${email}";`
    const i=await db.run(q)
    res.send(s)
})

app.delete("/delete/:email",async (req,res)=>{
    const {email}=req.params
    const a=`delete from userdetails
    where email="${email}";
    `
    const b=await db.run(a)
    res.send("delted successfully")
})
