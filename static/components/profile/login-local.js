export const logUser = function (response) {
    return {
           idToken: "1234abcd-1234-abcd-1234-abcd1234abcd",
           userId: "1234abcd-1234-abcd-1234-abcd1234abcd",
           email: 'test_user@gmail.com',
           name: 'Goofy Goofest',
           picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDEzLQIYir3TKubuEpEgSS3mMWvKbUtPbPzzcKV0V3ai2Jq4FLsL6Kno0aD3H1R34xzsM&usqp=CAU'
    }
};

export const mounted = function (component){
    component.logUser();
}