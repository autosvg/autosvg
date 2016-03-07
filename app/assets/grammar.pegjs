start =
    automaton_type ws attrs? automaton_body

automaton_type =
    "finite automaton" / "fa"

automaton_body =
    block_start states:(state_block?) block_end 
    { return states; }

state_block =
    name:("state" / "s") ws attrs? block_start states:states block_end
    { return states; }

states =
    state*

state =
    name:$([a-zA-Z_]+) attrs*
    { return name; }

attrs =
    "[" attrs:(attr*) "]" ws { return attrs }

attr =
    name:$([a-zA-Z_]+) ws 
    { return name;}

block_start =
   "{" ws 

block_end =
    ws "}"

ws = 
    [ \t\n\r]* { return "ws" }
