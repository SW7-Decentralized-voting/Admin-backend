<span style="font-size: 2.4rem; font-weight: 500"> Admin API</span>
--
API for the admin backend

---

<details open>
<summary style="font-size: 2.125rem; font-weight: 500">Election</summary>

Routes relating to the election phases

<span style="font-size: 1.675rem; font-weight: 500;"> <span style="color: orange; background:rgb(50,50,50); border-radius: 5px; padding: 2px 5px">POST</span> Start election</span>

> ```
> http://localhost:8888/election/start
> ```
> 
> Starts the election on the blockchain microservice.
>
<div style="margin-top: -10px"></div>

> ### Example Responses
>
<div style="margin-top: -10px"></div>

><span style="color: green; 
		background:rgb(50,50,50); border-radius: 5px; padding: 2px 3px">200</span>
>
> ```json
> {
>     "message": "Election started successfully"
> }
> ```
> 
><span style="color: red; 
		background:rgb(50,50,50); border-radius: 5px; padding: 2px 3px">400</span>
>
> ```json
> {
>     "error": "Election has already started"
> }
> ```
> 
<div style="margin-top: 30px"></div>

><div style="margin-top: 30px"></div>

</details>

---

<details open>
<summary style="font-size: 2.125rem; font-weight: 500">Candidates</summary>

Routes relating to the candidates.

<span style="font-size: 1.675rem; font-weight: 500;"> <span style="color: orange; background:rgb(50,50,50); border-radius: 5px; padding: 2px 5px">POST</span> Create candidate</span>

> ```
> http://localhost:8888/candidates
> ```
> 
> Creates a candidate based on the fields in the body (name, party, nominationDistrict).
> 
> ## Body
> 
> | **Field** | **Requirements** |
> | --- | --- |
> | `name` | `String` between 2 and 100 characters. Can contain letters (lower- and uppercase) a-z and æ, ø, å, as well as '-', and whitespaces. |
> | `party` | A valid Mongoose `ObjectId` (24-character hexadecimal string) |
> | `nominationDistrict` | A valid Mongoose `ObjectId` (24-character hexadecimal string) |
>
<div style="margin-top: -10px"></div>

> ### Example Responses
>
<div style="margin-top: -10px"></div>

><span style="color: green; 
		background:rgb(50,50,50); border-radius: 5px; padding: 2px 3px">201</span>
>
> ```json
> {
>     "message": "Candidate added successfully",
>     "candidate": {
>         "name": "Test Testsen",
>         "party": "67122e0533de8228a9e48a28",
>         "nominationDistrict": "67122e0633de8228a9e48a34",
>         "_id": "671cfc6248efb99986893593",
>         "createdAt": "2024-10-26T14:27:46.497Z",
>         "updatedAt": "2024-10-26T14:27:46.497Z",
>         "__v": 0
>     }
> }
> ```
> 
<div style="margin-top: 30px"></div>

><div style="margin-top: 30px"></div>

<span style="font-size: 1.675rem; font-weight: 500;"> <span style="color: magenta; background:rgb(50,50,50); border-radius: 5px; padding: 2px 5px">PATCH</span> Update Candidate</span>

> ```
> http://localhost:8888/candidates/{id}
> ```
> 
> Updates an existing candidate with id in params and updates fields in body with given values (assuming they can be validated):
> 
> | **Param** | **Requirements** |
> | --- | --- |
> | `id` | A valid Mongoose `ObjectId` (24-character hexadecimal string) |
> 
> ## Body
> 
> | Field | **Requirements** |
> | --- | --- |
> | `name` | `String` between 2 and 100 characters. Can contain letters (lower- and uppercase) a-z and æ, ø, å, as well as '-', and whitespaces. |
> | `party` | A valid Mongoose `ObjectId` (24-character hexadecimal string) |
> | `nominationDistrict` | A valid Mongoose `ObjectId` (24-character hexadecimal string) |
>
<div style="margin-top: -10px"></div>

> ### Example Responses
>
<div style="margin-top: -10px"></div>

><span style="color: green; 
		background:rgb(50,50,50); border-radius: 5px; padding: 2px 3px">200</span>
>
> ```json
> {
>     "message": "Candidate updated successfully",
>     "candidate": {
>         "_id": "671cfa07534d2498ace3e217",
>         "name": "Bettina Bendtsen",
>         "party": "671cfa06534d2498ace3e1dd",
>         "nominationDistrict": "671cfa06534d2498ace3e1e9",
>         "__v": 0,
>         "createdAt": "2024-10-26T14:17:43.052Z",
>         "updatedAt": "2024-10-26T15:01:39.478Z"
>     }
> }
> ```
> 
<div style="margin-top: 30px"></div>

><div style="margin-top: 30px"></div>

<span style="font-size: 1.675rem; font-weight: 500;"> <span style="color: red; background:rgb(50,50,50); border-radius: 5px; padding: 2px 5px">DELETE</span> Delete Candidate</span>

> ```
> http://localhost:8888/candidates/671cfa07534d2498ace3e213
> ```
> 
> Deletes candidate with id given in param:
> 
> | **Param** | **Requirements** |
> | --- | --- |
> | `id` | A valid Mongoose `ObjectId` (24-character hexadecimal string) |
>
<div style="margin-top: -10px"></div>

> ### Example Responses
>
<div style="margin-top: -10px"></div>

><span style="color: green; 
		background:rgb(50,50,50); border-radius: 5px; padding: 2px 3px">200</span>
>
> ```json
> {
>     "message": "Candidate deleted successfully",
>     "candidate": {
>         "_id": "671cfa07534d2498ace3e213",
>         "name": "Fanny Findsen",
>         "party": "671cfa06534d2498ace3e1dc",
>         "nominationDistrict": "671cfa06534d2498ace3e1e8",
>         "__v": 0,
>         "createdAt": "2024-10-26T14:17:43.052Z",
>         "updatedAt": "2024-10-26T14:17:43.052Z"
>     }
> }
> ```
> 
><span style="color: green; 
		background:rgb(50,50,50); border-radius: 5px; padding: 2px 3px">204</span>
>
> ```json
> undefined
> ```
> 
<div style="margin-top: 30px"></div>

><div style="margin-top: 30px"></div>

</details>

---

<details open>
<summary style="font-size: 2.125rem; font-weight: 500">Parties</summary>

Requests relating to the parties

<span style="font-size: 1.675rem; font-weight: 500;"> <span style="color: orange; background:rgb(50,50,50); border-radius: 5px; padding: 2px 5px">POST</span> Create Party</span>

> ```
> http://localhost:8888/parties
> ```
> ><div style="margin-top: 30px"></div>

<span style="font-size: 1.675rem; font-weight: 500;"> <span style="color: magenta; background:rgb(50,50,50); border-radius: 5px; padding: 2px 5px">PATCH</span> Update Party</span>

> ```
> http://localhost:8888/parties/{{partyId}}
> ```
> ><div style="margin-top: 30px"></div>

<span style="font-size: 1.675rem; font-weight: 500;"> <span style="color: red; background:rgb(50,50,50); border-radius: 5px; padding: 2px 5px">DELETE</span> New Request</span>

> ```
> http://localhost:8888/parties/{{
> ```
> ><div style="margin-top: 30px"></div>

</details>

---

