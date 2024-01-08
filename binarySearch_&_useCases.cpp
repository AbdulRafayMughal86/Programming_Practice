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

int binarySearch(vector<int> &arr, int n, int key, int start = 0){
    int s = start, e = n - 1, mid;
    mid = s + (e - s) / 2;
    while(s <= e){
        if(arr[mid] == key)
            return mid;
        else if(arr[mid] > key)
            e = mid - 1;
        else
            s = mid + 1;
        mid = s + (e - s) / 2;
    }
    return -1;
}

int firstOccurence(vector<int> &arr, int n, int k){
    int s = 0, e = n - 1, ans = -1;
    int m = (s + (e - s) / 2);
    while(s <= e){
        if(arr[m] < k)
            s = m + 1;
        else if(arr[m] > k)
            e = m - 1;
        else{
            ans = m;
            e = m - 1;
        }
        m = (s + e) / 2;
    }
    return ans;
}

int lastOccurence(vector<int> &arr, int n, int k){
    int s = 0, e = n - 1, ans = -1;
    int m = (s + (e - s) / 2);
    while(s <= e){
        if(arr[m] < k)
            s = m + 1;
        else if(arr[m] > k)
            e = m - 1;
        else{
            ans = m;
            s = m + 1;
        }
        m = (s + e) / 2;
    }
    return ans;
}

int countOccurences(vector<int> &arr, int n, int k){
    if(firstOccurence(arr, n, k) == -1) return 0;
    return lastOccurence(arr, n, k) - firstOccurence(arr, n, k) + 1;
}

int peakMountain(vector<int> &arr, int n){
    int s = 0, e = n - 1;
    int m = (s + e) / 2;
    while(s < e){
        if(arr[m] < arr[m + 1])
            s = m + 1;
        else
            e = m;
        m = (s + e) / 2;
    }
    return s;
}

int pivotArray(vector<int> &arr, int n){
    int s = 0, e = n - 1;
    int m = (s + e) / 2;
    while(s < e){
        if(arr[m] >= arr[0])
            s = m + 1;
        else
            e = m;
        m = (s + e) / 2;
    }
    return s;
}

int binarySearchRotatedArray(vector<int> &arr, int n, int k){
    int pivot = pivotArray(arr, n);
    if(k >= arr[pivot] && k <= arr[n - 1])
        return binarySearch(arr, n, k, pivot);
    return binarySearch(arr, pivot, k);
}

int squareRoot(int n){
    int s = 0, e = n, ans = 0;
    int m = s + (e - s) / 2;
    while(s <= e){
        if(m * m == n)
            return m;
        else if(m * m > n)
            e = m - 1;
        else{
            ans = m;
            s = m + 1;
        }
        m = s + (e - s) / 2;
    }
    return ans;
}

void solve(){
    //--------------
    //Code goes here
    //--------------
    vi arr = {6,5,4,4,4,3,2,1};
    int n = arr.size();

    cout << countOccurences(arr, n, 4) << endl;
}


signed main(){
    io;
    // freopen("input.txt", "r", stdin);
    // freopen("output.txt", "w", stdout);

    int t = 1;
    //cin >> t;
    while(t--){
        solve();
    }

    return 0;
}