const asyncWrap = (fn)=>{
    return (req,res,next)=>{
        // console.log(req);
        fn(req,res,next).catch(next);
    }
}


export { asyncWrap };