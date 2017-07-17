ACC="xyz"

echo "List all accounts before the operation"
curl "http://localhost:3000/Accounts" -X GET 2> /dev/null | jq '.'

sleep 1 
echo "Adding new account $ACC"
curl "http://localhost:3000/Account?name=$ACC&password=321" -X PUT

echo "Deleting account $ACC"
curl "http://localhost:3000/Account/$ACC" -X DELETE
