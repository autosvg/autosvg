{

}

start =
    type:automaton_type ws attrs:(attrs?) body:automaton_body
    {   
        let automaton = new Object();
        automaton.type = type;
        automaton.symbols = body.alphabet_block;
        automaton.states = body.states_block;
        automaton.transitions = body.transition_block;
        //automaton.attrs = attrs:
        return automaton;
    }

automaton_type =
    "finite automaton" / "fa"

automaton_body =
    block_start states_block:(states_block?) ws alphabet_block:(alphabet_block?) ws transition_block:(transition_block?) block_end 
    {  
        
        let body = new Object();
        body.states_block =  states_block;
        body.alphabet_block =  alphabet_block;
        body.transition_block =  transition_block;
        //body.attrs = attrs;
        return body;
   }

states_block =
    name:("states" / "s") ws attrs:(attrs?) block_start states:states block_end
    {   
        let states_block = new Object();
        states_block.states =  states;
        states_block.attrs = attrs;
        return states_block; 
    }

states =
    state* 

state =
    name:$([a-zA-Z_0-9]+) attrs:(attrs?) ws
    {     
       let state = new Object();
       state.name = name;
       state.attrs = attrs;
       return state;
    }

alphabet_block =
    name:("alphabet" / "a") ws attrs:(attrs?) block_start alphabet:symbols block_end
    {  
        let alphabet_block = new Object();
       // alphabet_block.attrs = attrs;
        alphabet_block.symbols =  alphabet;
        return alphabet_block; 
        
    }

symbols =
    symbol*

symbol =
    name:$([a-zA-Z_]+) attrs:(attrs?) ws
    {  
       let symbol = new Object();
       symbol.name = name ;
      // symbol.attrs = attrs;
       return symbol;
    }

transition_block =
    name:("transitions" / "t") ws attrs:(attrs?) block_start transitions:transitions block_end
    {  
        let transition_block = new Object();
        //transition_block.attrs =  attrs;
        transition_block.transitions =  transitions;
        return transition_block; 
        
    }
    

transitions =
    transition*

transition =
    start:$([a-zA-Z_0-9]+)ws symbol:$([a-zA-Z_0-9]+)ws "->"  ws end:$([a-zA-Z_0-9]+)ws  attrs:(attrs?) ws
    {  
        let transition = new Object();
        transition.from =  start;
        transition.by =  symbol;
        transition.to =  end;
        transition.attrs = attrs;
        return transition;
        
    }



attrs =
    "[" attrs:(attr*) "]" ws { return attrs; }

attr =
    name:$([a-zA-Z_]+) ws "=" ws value:$([a-zA-Z_]+) ws  /name:$([a-zA-Z]+)
    { 
        if(checkNow(value).isMissing()){
            value = true;
        } 
        return {name:name,value:value};     

     }


block_start =
   "{" ws 

block_end =
    ws "}"

ws = 
    [ \t\n\r]* { return "ws" }
