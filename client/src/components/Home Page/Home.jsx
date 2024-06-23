import { useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav"
import { motion } from "framer-motion";
import animationData from "../../assets/animation.json"
import { Link } from "react-router-dom";


import SearchIcon from "./SearchIcon"
export default function Home(){
    const [searchInput, setSearchInput]=useState(null);
    const [searchResponse,setSearchResponse]=useState([]);

    const handleChange=async (e)=>{
        setSearchInput(e.target.value);

        e.preventDefault();
        const prefix = e.target.value;
        console.log(prefix);
           
        axios.get(`http://localhost:8081/api/v1/categories?prefix=${prefix}`)
        .then((response) => {               
            const json=response.data;
            if (response.status === 200) {
                // console.log(json.searchResults);
                setSearchResponse(json);
                console.log(json)
            }
            else{
                // Handle errors here
                console.error('Request failed');
                // setError(response.data.error)
                
            }                
        })
        .catch((error) => {
            console.error(error.response.data.error);
           
            
        });
    }
    const listVariants = {
        hidden: {
          opacity: 0,
        },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15, // Staggering delay between each item
          },
        },
      };

      const itemVariants = {
        hidden: { opacity: 0, y: -20 }, // Initial state of each item
        visible: { opacity: 1, y: 0 }, // Target state of each item
      };


      const searchVariants = {
        hidden: { opacity: 0,  }, 
        visible: { 
            opacity: 1,
            transition:{
                delay:1,
                duration:1
            }  

        }, 
      };

      const listItems=["Unlock Your", "Favorite Foods'", "Nutritional Secrets"]

      const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData, // Pass your animation JSON data here
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
    return(
        <div className="flex flex-col h-screen overflow-x-hidden">
            <div className="flex-none"><Nav /></div>
            <div className="flex-1 flex flex-col  text-white">
                <div className="flex justify-between h-auto bg-gradient-to-r from-red-900 via-red-800 to-red-600 ml-1 mr-1 pb-40">
                    
              
                    <div className="text-white basis-1/2 text-7xl ml-[1vw] font-bold font-ubuntu mt-20 mb-3 flex justify-center">
                    {/* Staggered animation on list items */}
                    <motion.ul
                        initial="hidden"
                        animate="visible"
                        variants={listVariants}
                    >
                        {listItems.map((item, index) => (
                        <motion.li key={index} variants={itemVariants} className="mb-3">
                            {item}
                        </motion.li>
                        ))}
                    </motion.ul>
                    </div>

                        {/* <div className="ml-20">
                        <Lottie
                            options={defaultOptions}
                            height={350}
                            width={350}
                        />
                        </div> */}

           
  

                    
                    
                    <motion.div variants={searchVariants} initial="hidden" animate="visible" className="flex flex-col mr-[10vw] mt-40  mb-10 items-center">
                        <div className="relative bottom-10 font-sacramento text-5xl">Search for a food category</div>
                        <div className="flex">
                            <input type="text" 
                            placeholder="Enter" 
                            className="outline-none rounded-l-3xl opacity-80 text-black pl-5 p-2 text-xl font-lato h-[3.5vw] w-[25vw] "
                            onChange={handleChange}>
                            </input>
                            
                            <div className="flex justify-center items-center outline-none h-[3.5vw] w-[5vw] bg-white bg-opacity-80 rounded-r-3xl">
                                <SearchIcon />
                            </div>
                        </div>
                        
                        
                        {searchResponse && 
                            <div className={`absolute top-80 mt-5 text-black w-[27rem] flex flex-col rounded-sm bg-white z-50`}>
                                {searchResponse.map((response,index)=>(
                                    <Link to={`/category/${response.category}`} key={index}>
                                    <div className="flex justify-between border-b-2 border-gray-400 cursor-pointer hover:bg-slate-500 p-2">
                                        {response.category}
                                    
                                    </div>
                                    </Link>
                                ))}
                            </div>
                        }
                    </motion.div>
                </div>

                <div className="flex flex-col mb-4 w-full">
                    
                    <div className="flex mt-3 ml-5 w-full ">
                        <img src="pic2.jpg" className=" h-[30vw] w-auto" alt="Nike"></img>
                        
                        
                        <div className="flex flex-col ml-2 mt-10 w-4/6">
                            <div className="text-black text-4xl font-bold font-ubuntu mt-5 mb-3 flex justify-center">
                                Nutritional Insights across diverse food categories
                            </div>
                            <div className="flex flex-col text-black ml-[5.2vw] w-[50vw]">
                            <div>From staples like bread and peanut butter to an extensive selection of packaged goods, our database covers 
                            a wide range of products, ensuring there's something to suit every taste and dietary preference. </div>
                            With user-friendly search functionality, navigating through our comprehensive database is effortless, 
                            making it easy to find the nutritional information you need, whenever you need it. Whether you're tracking 
                            macros, managing dietary restrictions, or simply curious about the nutritional content of your favorite snacks,
                             our platform puts the power of knowledge at your fingertips, enabling you to make informed choices and fueling 
                             your journey toward healthier eating habits.
                            </div>
                            
                        </div>
                        
                    </div>
                    
                </div>  
            
            </div>
        </div>
    )
}