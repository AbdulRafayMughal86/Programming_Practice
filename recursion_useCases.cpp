#include <bits/stdc++.h>
using namespace std;

#define io ios::sync_with_stdio(false); cin.tie(0);
#define int long long int
#define vi vector<int>
#define pii pair<int, int>
#define PB push_back
#define F first
#define S second
#define MP make_pair
#define all(v) v.begin(), v.end()
#define forn(a, n) for(int i = a ; i < n ; i++)
#define yesno(b) cout << ((b)? "YES" : "NO")
#define nl cout << "\n";
#define print(v,a) for(auto _ : v) cout << _ << a;

void PowerSet(int index, vector<vector<int>> &ans, vector<int> &arr, vector<int> temp){
    if(index == arr.size()){
        ans.push_back(temp);
        return ;
    }
    //Exclude
    PowerSet(index + 1, ans, arr, temp);
    
    //Include
    temp.push_back(arr[index]);
    PowerSet(index + 1, ans, arr, temp);
}

void UniqueSubsets(int index, vector<vector<int>> &ans, vector<int> &arr, vector<int> temp){
    ans.push_back(temp);
    for(int i = index ; i < arr.size() ; i++){
        if(i > index && arr[i] == arr[i - 1]) // To get unique only
            continue;
        temp.push_back(arr[i]);
        UniqueSubsets(i + 1, ans, arr, temp);
        temp.pop_back();
    }
}

void Permutations(int index, vector<vector<int>> &ans, vector<int> &arr){
    if(index == arr.size())
        ans.push_back(arr);
    for(int i = index ; i < arr.size() ; i++){
        swap(arr[i], arr[index]);
        Permutations(i + 1, ans, arr);
        swap(arr[i], arr[index]);
    }
}

void CombinationSum(int index, int sum, vector<vector<int>> &ans, vector<int> &arr, vector<int> temp){
    if(index == arr.size() || sum == 0){
        if(sum == 0) ans.push_back(temp);
        return ;
    }

    if(sum >= arr[index]){
        temp.push_back(arr[index]);
        CombinationSum(index, sum - arr[index], ans, arr, temp);
        temp.pop_back();
    }
    CombinationSum(index + 1, sum, ans, arr, temp);
}

void CombinationSumWithoutDuplicates(int index, int sum, vector<vector<int>> &ans, vector<int> &arr, vector<int> temp){
    //For Sorted Array
    if(sum == 0){
        ans.push_back(temp);
        return ;
    }

    for(int i = index ; i < arr.size() ; i++){
        if(i != index && arr[i] == arr[i - 1]) 
            continue;
        if(sum < arr[i]) 
            break;
        temp.push_back(arr[i]);
        CombinationSumWithoutDuplicates(i + 1, sum - arr[i], ans, arr, temp);
        temp.pop_back();
    }
}

void solve(){
    //--------------
    //Code goes here
    //--------------
}


signed main(){
    io;
    // freopen("input.txt", "r", stdin);
    // freopen("output.txt", "w", stdout);

    int t = 1;
    //cin >> t;
    while(t--){
        solve();
        nl;
    }

    return 0;
}