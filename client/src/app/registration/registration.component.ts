import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent  {

  // implements OnInit
  // constructor(private httpService:HttpService,private fb:FormBuilder,private router:Router){}

  // itemForm!:FormGroup;

  // ngOnInit(): void {
    
  //   this.itemForm=this.fb.group({

  //     username:["",[Validators.required]],
  //     password:["",Validators.required],
  //     email:["",[Validators.email,Validators.required]],
  //     role:["",[Validators.required]]

  //   })

  // }
  // responseMessage:string="";
  // showMessage:boolean=false;

  // onRegister():void{
  //   if(this.itemForm.valid){

  //     this.httpService.registerUser(this.itemForm.value).subscribe(()=>{

  //       this.responseMessage="User Registered successfully";

  //       this.router.navigateByUrl('/login');
  //     })


  //   }




  // }



}
