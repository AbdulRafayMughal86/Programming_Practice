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

void selectionSort(int arr[], int n){
    for(int i = 0 ; i < n ; i++){
        int mini = arr[i], index = i;
        for(int j = i + 1 ; j < n ; j++)
            if(arr[j] < mini)
                mini = arr[j], index = j;

        swap(arr[i], arr[index]);
    }
}

void bubbleSort(int arr[], int n){
    for(int j = n - 1 ; j > 0 ; j--){
        bool swapped = false;
        for(int i = 0 ; i < j ; i++)
            if(arr[i] > arr[i + 1]){
                swap(arr[i], arr[i + 1]);
                swapped = true;
            }
        if(!(swapped))
            return ;
    }
}

void insertionSort(int arr[], int n){
    for(int i = 1 ; i < n ; i++){
        int temp = arr[i], j = i - 1;
        for( ; j >= 0; j--)
            if(arr[j] > temp)
                arr[j + 1] = arr[j];
            else
                break;
        arr[j + 1] = temp;
    }
}

void merge(int* arr, int s, int e){
    int mid = (s + e) / 2;
    int s1 = mid - s + 1, s2 = e - mid, a = 0, b = 0, i = 0;

    int* arr1 = new int[s1], *arr2 = new int[s2];
    for( i = s ; a < s1 ; i++)
        arr1[a] = arr[i], a++;
    for( i = mid + 1 ; b < s2 ; i++)
        arr2[b] = arr[i], b++;
    
    for( i = s, a = 0, b = 0 ; a < s1 && b < s2 ; i++){
        if(arr1[a] < arr2[b])
            arr[i] = arr1[a], a++;
        else
            arr[i] = arr2[b], b++;
    }
    while(a < s1){
        arr[i++] = arr1[a++]; 
    }
    while(b < s2){
        arr[i++] = arr2[b++]; 
    }

    delete[] arr1;
    delete[] arr2;
}
void mergeSort(int* arr, int s, int e){
    if(s >= e)
        return;
    int mid = (s + e) / 2;
    mergeSort(arr, s, mid);
    mergeSort(arr, mid + 1, e);
    merge(arr, s, e);
}

int partition(int* arr, int s, int e){
    int pivot = arr[s], count = 0;

    for(int i = s ; i <= e ; i++){
        if(arr[i] < arr[s])
            count++;
    }

    int pivotIndex = s + count;
    swap(arr[pivotIndex], arr[s]);

    int i = s, j = e;
    while(i < pivotIndex && j > pivotIndex){
        if(arr[i] < pivot)
            i++;
        else if(arr[j] > pivot)
            j--;
        else
            swap(arr[i++], arr[j--]);
    }

    return pivotIndex;
}
void quickSort(int* arr, int s, int e){
    if(s >= e)
        return;
    int p = partition(arr, s, e);
    quickSort(arr, s, p);
    quickSort(arr, p + 1, e);
}

void solve(){
    //--------------
    //Code goes here
    //--------------
    int array[] = {5,4,3,2,1};
    int n = sizeof(array) / sizeof(array[0]);

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