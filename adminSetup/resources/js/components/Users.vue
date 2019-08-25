<template>
  <div class="container">
    <div v-if="!$gate.isAdminOrAuthor()">
      <not-found></not-found>
    </div>

    <div class="row" v-if="$gate.isAdminOrAuthor()">
      <div class="col-md-12 mt-5">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Users List</h3>

            <div class="card-tools">
              <button class="btn btn-success" @click="newModel()">
                <i class="fa fa-user-plus"></i>
              </button>
            </div>
          </div>
          <!-- /.card-header -->
          <div class="card-body table-responsive p-0">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Registered At</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users.data" v-bind:key="user.id">
                  <td>{{user.id}}</td>
                  <td>{{user.name | uptext}}</td>
                  <td>{{user.email}}</td>
                  <td>{{user.type | uptext}}</td>
                  <th>{{user.created_at | humantime}}</th>
                  <td>
                    <button @click="editModel(user)">
                      <i class="fa fa-edit blue"></i>
                    </button>
                    /
                    <button @click="deleteUser(user.id)">
                      <i class="fa fa-trash red"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card-footer">
            <pagination @pagination-change-page="getResults" :data="users">
              <span slot="prev-nav">&lt; Previous</span>
              <span slot="next-nav">Next &gt;</span>
            </pagination>
          </div>
          <!-- /.card-body -->
        </div>
        <!-- /.card -->
      </div>
    </div>
    <div
      class="modal fade"
      id="addNewUser"
      tabindex="-1"
      role="dialog"
      aria-labelledby="addNewUserLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5
              class="modal-title"
              id="addNewUserLabel"
            >{{ isEditMode ? 'Edit User' : 'Add New User' }}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <form @submit.prevent="isEditMode ? updateUser() : createUser()">
            <div class="modal-body">
              <div class="form-group">
                <label>Username</label>
                <input
                  v-model="form.name"
                  type="text"
                  name="name"
                  class="form-control"
                  :class="{ 'is-invalid': form.errors.has('name') }"
                />
                <has-error :form="form" field="name"></has-error>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  name="email"
                  class="form-control"
                  :class="{ 'is-invalid': form.errors.has('email') }"
                />
                <has-error :form="form" field="email"></has-error>
              </div>

              <div class="form-group">
                <label>Bio</label>
                <textarea
                  v-model="form.bio"
                  type="text"
                  name="bio"
                  class="form-control"
                  :class="{ 'is-invalid': form.errors.has('bio') }"
                ></textarea>
                <has-error :form="form" field="bio"></has-error>
              </div>

              <div class="form-group">
                <label>Type</label>
                <select
                  v-model="form.type"
                  name="type"
                  class="form-control"
                  :class="{ 'is-invalid': form.errors.has('type') }"
                >
                  <option value>-- Select --</option>
                  <option value="admin">Admin</option>
                  <option value="user">Standard User</option>
                  <option value="author">Author</option>
                </select>
                <has-error :form="form" field="type"></has-error>
              </div>

              <div class="form-group">
                <label>Password</label>
                <input
                  v-model="form.password"
                  type="password"
                  name="password"
                  class="form-control"
                  :class="{ 'is-invalid': form.errors.has('password') }"
                />
                <has-error :form="form" field="password"></has-error>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
              <button
                type="submit"
                class="btn btn-primary"
              >{{ isEditMode ? 'Save' : 'Create User' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userBeingEdited: "",
      isEditMode: false,
      form: new Form({
        name: "",
        email: "",
        password: "",
        bio: "",
        type: ""
      }),
      users: {}
    };
  },
  created() {
    this.loadUsers();
    Fire.$on('searching',()=>{
        let query = this.$parent.search;
        axios.get('api/findUser?q='+ query).then((data)=>{
            this.users = data.data
        }).catch(()=>{

        });
    })
  },
  methods: {
    newModel() {
      this.isEditMode = false;
      this.form.reset();
      $("#addNewUser").modal("show");
    },
    getResults(page = 1) {
      axios.get("api/user?page=" + page).then(response => {
        this.users = response.data;
      });
    },
    editModel(user) {
      this.isEditMode = true;
      this.userBeingEdited = user.id;
      this.form.reset();
      $("#addNewUser").modal("show");
      this.form.fill(user);
    },
    createUser() {
      this.$Progress.start();
      this.form
        .post("api/user")
        .then(() => {
          toast.fire({
            type: "success",
            title: "User created successfully"
          });

          this.$Progress.finish();

          this.loadUsers();
        })
        .catch(() => {
          this.$Progress.fail();
        });
    },
    updateUser() {
      this.$Progress.start();
      this.form
        .put("api/user/" + this.userBeingEdited, this.form)
        .then(() => {
          this.loadUsers();
          toast.fire({
            type: "success",
            title: "User updated successfully"
          });
          this.$Progress.finish();
        })
        .catch(() => {
          toast.fire({
            type: "warning",
            title: "An Error Occured"
          });
          this.$Progress.fail();
        });
    },
    loadUsers() {
      if (!this.$gate.isAdminOrAuthor()) {
        return;
      }
      $("#addNewUser").modal("hide");
      axios.get("api/user").then(({data}) => {
        this.users = data;
      });
    },
    deleteUser(userId) {
      swal
        .fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!"
        })
        .then(result => {
          if (result.dismiss) {
            return;
          }
          // Send Request to the server
          this.form
            .delete("api/user/" + userId)
            .then(serverResult => {
              swal.fire("Deleted!", "Your file has been deleted.", "success");
              this.loadUsers();
            })
            .catch(() => {
              swal.fire("Failed!", "Something went wrong", "warning");
            });
        });
    }
  }
};
</script>
