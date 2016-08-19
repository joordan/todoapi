var person = {
	name: 'jae',
	age: 20
};

function updatePerson (obj) {
	obj = {
		name: 'Jae',
		age: 25
	}
} //does not change, need to mutate i.e. set the attribute


function mutatePerson (obj) {
	obj.age = 40;
} //does not change, need to mutate i.e. set the attribute

updatePerson(person);

console.log(person);


mutatePerson(person);

console.log(person);

// Array example

grades = [15, 88];

function addGrades (grades) {
	grades.push(55)
	debugger;
}

addGrades(grades);
console.log(grades);
