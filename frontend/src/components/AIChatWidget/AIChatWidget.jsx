import React, { useState, useEffect, useRef } from 'react';
import './AIChatWidget.css';
import axios from 'axios';
import { Sparkles } from 'lucide-react';

const AIChatWidget = () => {

    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);



    // Greeting

    useEffect(() => {

        if(isOpen && messages.length === 0){

            setMessages([
                {
                    sender:'ai',
                    text:"Hi! I'm DashDish AI ✨ How can I help you choose your food today?"
                }
            ]);

        }

    },[isOpen]);





    // Auto scroll

    useEffect(()=>{

        messagesEndRef.current?.scrollIntoView({
            behavior:"smooth"
        });

    },[messages,isLoading]);






    const handleSend = async(e)=>{

        e.preventDefault();


        if(!input.trim() || isLoading)
            return;



        const userMsg={
            sender:"user",
            text:input
        };



        setMessages(prev=>[
            ...prev,
            userMsg
        ]);

        setInput("");

        setIsLoading(true);



        try{


            const response = await axios.post(
                `${url}/api/ai/chat`,
                {
                    message:userMsg.text,
                    history:messages
                }
            );



            if(response.data.success){


                setMessages(prev=>[
                    ...prev,
                    {
                        sender:"ai",
                        text:"",
                        isTyping:true,
                        fullText:response.data.text
                    }
                ]);


            }
            else{


                setMessages(prev=>[
                    ...prev,
                    {
                        sender:"ai",
                        text:"Sorry, something went wrong."
                    }
                ]);

            }



        }
        catch(error){


            setMessages(prev=>[
                ...prev,
                {
                    sender:"ai",
                    text:"Unable to connect with AI right now."
                }
            ]);


        }
        finally{

            setIsLoading(false);

        }


    };







    // Typing effect

    useEffect(()=>{


        const lastMessage =
        messages[messages.length-1];



        if(lastMessage?.isTyping){


            let index=0;



            const interval=setInterval(()=>{


                if(index < lastMessage.fullText.length){


                    setMessages(prev=>{


                        const updated=[...prev];

                        updated[updated.length-1].text =
                        lastMessage.fullText.slice(0,index+1);


                        return updated;

                    });


                    index++;

                }
                else{


                    clearInterval(interval);


                    setMessages(prev=>{


                        const updated=[...prev];


                        updated[updated.length-1].isTyping=false;


                        return updated;


                    });


                }


            },20);



            return ()=>clearInterval(interval);


        }



    },[messages]);






return (

<div className={`ai-chat-widget ${isOpen ? "open":""}`}>



{
!isOpen &&

<button 
className="ai-chat-btn"
onClick={()=>setIsOpen(true)}
>


<div className="ai-icon">

<Sparkles size={25}/>

</div>


<span>
AI Assistant
</span>


</button>

}





{
isOpen &&


<div className="ai-chat-window">


<div className="ai-chat-header">


<div className="ai-title">


<h3>
DashDish AI ✨
</h3>


<p>
Live Food Assistant
</p>


</div>



<button
className="close-btn"
onClick={()=>setIsOpen(false)}
>
×
</button>


</div>





<div className="ai-chat-body">


{
messages.map((msg,index)=>(


<div
key={index}
className={`chat-bubble ${msg.sender}`}
>

<div className="chat-text">

{msg.text}

</div>


</div>


))
}




{
isLoading &&

<div className="chat-bubble ai loading">

<div className="typing-dots">

<span></span>
<span></span>
<span></span>

</div>

</div>

}



<div ref={messagesEndRef}/>


</div>





<form 
className="ai-chat-input"
onSubmit={handleSend}
>


<input

type="text"

placeholder="Ask food recommendations..."

value={input}

onChange={(e)=>setInput(e.target.value)}

/>



<button
disabled={isLoading}
>

➤

</button>



</form>



</div>


}



</div>


);


};


export default AIChatWidget;