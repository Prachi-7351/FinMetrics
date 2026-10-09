export const detectIntent = (prompt) => {

const text = prompt.toLowerCase();

if(
text.includes("compare")
)
return "compare";

if(
text.includes("stock") ||
text.includes("share") ||
text.includes("market") ||
text.includes("price")
)
return "market";

if(
text.includes("expense") ||
text.includes("cash flow") ||
text.includes("profit") ||
text.includes("budget")
)
return "business";

return "general";

};